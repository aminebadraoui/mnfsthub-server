import { db } from '../db/index.js';
import { users } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const signUp = async (userData) => {
    try {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
            throw new Error('Email, password, first name, and last name are required');
        }

        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const newUser = {
            id: uuidv4(),
            tenantId: uuidv4(), // Generate a unique tenant ID for the user
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user',
            metadata: userData.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [createdUser] = await db.insert(users).values(newUser).returning();

        // Generate JWT token
        const token = jwt.sign(
            { id: createdUser.id, tenantId: createdUser.tenantId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data and token (excluding password)
        const { password, ...userWithoutPassword } = createdUser;
        return {
            ...userWithoutPassword,
            token
        };
    } catch (error) {
        console.error('Error in signUp:', error);
        throw error;
    }
};

export const signIn = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, tenantId: user.tenantId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data and token (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    } catch (error) {
        console.error('Error in signIn:', error);
        throw error;
    }
};

export const signOut = () => {
    // Since we're using JWT tokens, we don't need to do anything server-side
    // The client should remove the token from storage
    return true;
}; 