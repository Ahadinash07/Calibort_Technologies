import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  is_external: boolean;
  external_id: number | null;
  created_at: Date;
  updated_at: Date;
}

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, email, first_name, last_name, avatar, is_external, created_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params: any[] = [];
    
    if (search) {
      query += ' WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
      countQuery += ' WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    const [users] = await pool.query<User[]>(query, [...params, limit, offset]);
    const [countResult] = await pool.query<any[]>(countQuery, params);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query<User[]>(
      'SELECT id, email, first_name, last_name, avatar, is_external, external_id, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// Create user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.query<User[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name]
    );
    
    const userId = (result as any).insertId;
    
    // Fetch created user
    const [users] = await pool.query<User[]>(
      'SELECT id, email, first_name, last_name, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { email, first_name, last_name, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is taken by another user
    if (email && email !== users[0].email) {
      const [existingUsers] = await pool.query<User[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    params.push(id);
    
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Fetch updated user
    const [updatedUsers] = await pool.query<User[]>(
      'SELECT id, email, first_name, last_name, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [users] = await pool.query<User[]>(
      'SELECT avatar FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete avatar file if exists
    if (users[0].avatar) {
      const avatarPath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(users[0].avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const [users] = await pool.query<User[]>(
      'SELECT id, email, first_name, last_name, avatar, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// Update profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, email } = req.body;
    
    // Check if email is taken
    if (email) {
      const [existingUsers] = await pool.query<User[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    
    if (updates.length > 0) {
      params.push(userId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
    
    // Fetch updated profile
    const [users] = await pool.query<User[]>(
      'SELECT id, email, first_name, last_name, avatar, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    console.log('Upload request received:', {
      userId,
      hasFile: !!req.file,
      file: req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.'
      });
    }
    
    // Get old avatar
    const [users] = await pool.query<User[]>(
      'SELECT avatar FROM users WHERE id = ?',
      [userId]
    );
    
    // Delete old avatar if exists (but not external URLs)
    if (users.length > 0 && users[0].avatar && !users[0].avatar.startsWith('http')) {
      const oldAvatarPath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(users[0].avatar));
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
          console.log('Deleted old avatar:', oldAvatarPath);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
    }
    
    // Update avatar path
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, userId]
    );
    
    console.log('Avatar updated successfully:', avatarUrl);
    
    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Upload profile image error:', error);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      const uploadedFilePath = path.join(process.env.UPLOAD_PATH || './uploads', req.file.filename);
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading profile image'
    });
  }
};

// Mock data fallback when external API fails
const getMockUsers = () => [
  { id: 1, email: 'george.bluth@reqres.in', first_name: 'George', last_name: 'Bluth', avatar: 'https://reqres.in/img/faces/1-image.jpg' },
  { id: 2, email: 'janet.weaver@reqres.in', first_name: 'Janet', last_name: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' },
  { id: 3, email: 'emma.wong@reqres.in', first_name: 'Emma', last_name: 'Wong', avatar: 'https://reqres.in/img/faces/3-image.jpg' },
  { id: 4, email: 'eve.holt@reqres.in', first_name: 'Eve', last_name: 'Holt', avatar: 'https://reqres.in/img/faces/4-image.jpg' },
  { id: 5, email: 'charles.morris@reqres.in', first_name: 'Charles', last_name: 'Morris', avatar: 'https://reqres.in/img/faces/5-image.jpg' },
  { id: 6, email: 'tracey.ramos@reqres.in', first_name: 'Tracey', last_name: 'Ramos', avatar: 'https://reqres.in/img/faces/6-image.jpg' },
  { id: 7, email: 'michael.lawson@reqres.in', first_name: 'Michael', last_name: 'Lawson', avatar: 'https://reqres.in/img/faces/7-image.jpg' },
  { id: 8, email: 'lindsay.ferguson@reqres.in', first_name: 'Lindsay', last_name: 'Ferguson', avatar: 'https://reqres.in/img/faces/8-image.jpg' },
  { id: 9, email: 'tobias.funke@reqres.in', first_name: 'Tobias', last_name: 'Funke', avatar: 'https://reqres.in/img/faces/9-image.jpg' },
  { id: 10, email: 'byron.fields@reqres.in', first_name: 'Byron', last_name: 'Fields', avatar: 'https://reqres.in/img/faces/10-image.jpg' },
  { id: 11, email: 'george.edwards@reqres.in', first_name: 'George', last_name: 'Edwards', avatar: 'https://reqres.in/img/faces/11-image.jpg' },
  { id: 12, email: 'rachel.howell@reqres.in', first_name: 'Rachel', last_name: 'Howell', avatar: 'https://reqres.in/img/faces/12-image.jpg' }
];

// Fetch users from third-party API and store
export const fetchExternalUsers = async (req: AuthRequest, res: Response) => {
  let allUsers: any[] = [];
  let usedFallback = false;
  
  try {
    const apiUrl = process.env.REQRES_API_URL || 'https://reqres.in/api';
    
    // Configure axios with timeout and headers
    const axiosConfig = {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; UserManagementSystem/1.0)'
      }
    };
    
    // First, fetch page 1 to get total pages
    const firstResponse = await axios.get(`${apiUrl}/users?page=1`, axiosConfig);
    const totalPages = firstResponse.data.total_pages;
    
    allUsers = firstResponse.data.data;
    
    // Fetch remaining pages
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(axios.get(`${apiUrl}/users?page=${page}`, axiosConfig));
    }
    
    // Wait for all pages to be fetched
    const responses = await Promise.all(pagePromises);
    responses.forEach(response => {
      allUsers = allUsers.concat(response.data.data);
    });
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process all users
    for (const extUser of allUsers) {
      try {
        // Check if user already exists
        const [existing] = await pool.query<User[]>(
          'SELECT id FROM users WHERE external_id = ?',
          [extUser.id]
        );
        
        if (existing.length > 0) {
          skipped++;
          continue;
        }
        
        // Generate a default password for external users
        const defaultPassword = await bcrypt.hash('password123', 10);
        
        // Insert user
        await pool.query(
          'INSERT INTO users (email, password, first_name, last_name, avatar, is_external, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [extUser.email, defaultPassword, extUser.first_name, extUser.last_name, extUser.avatar, true, extUser.id]
        );
        
        imported++;
      } catch (error) {
        console.error(`Error importing user ${extUser.id}:`, error);
        errors++;
      }
    }
    
    const message = usedFallback 
      ? `Successfully imported ${imported} users from fallback data (external API unavailable)`
      : `Successfully imported ${imported} users from external API`;
    
    res.json({
      success: true,
      message,
      data: {
        imported,
        skipped,
        errors,
        total: allUsers.length,
        usedFallback
      }
    });
  } catch (error: any) {
    console.error('Fetch external users error:', error);
    
    // Use fallback mock data if API fails
    console.log('External API failed, using fallback mock data...');
    allUsers = getMockUsers();
    usedFallback = true;
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process mock users
    for (const extUser of allUsers) {
      try {
        // Check if user already exists
        const [existing] = await pool.query<User[]>(
          'SELECT id FROM users WHERE external_id = ?',
          [extUser.id]
        );
        
        if (existing.length > 0) {
          skipped++;
          continue;
        }
        
        // Generate a default password for external users
        const defaultPassword = await bcrypt.hash('password123', 10);
        
        // Insert user
        await pool.query(
          'INSERT INTO users (email, password, first_name, last_name, avatar, is_external, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [extUser.email, defaultPassword, extUser.first_name, extUser.last_name, extUser.avatar, true, extUser.id]
        );
        
        imported++;
      } catch (error) {
        console.error(`Error importing user ${extUser.id}:`, error);
        errors++;
      }
    }
    
    res.json({
      success: true,
      message: `Successfully imported ${imported} users from fallback data (external API unavailable)`,
      data: {
        imported,
        skipped,
        errors,
        total: allUsers.length,
        usedFallback: true
      }
    });
  }
};
