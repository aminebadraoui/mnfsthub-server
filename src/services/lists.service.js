import { db } from '../db/index.js';
import { lists } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const getLists = async (filters = {}) => {
    try {
        let query = db.select().from(lists);

        if (filters.tenantId) {
            query = query.where(eq(lists.tenantId, filters.tenantId));
        }

        return await query;
    } catch (error) {
        console.error('Error in getLists:', error);
        throw error;
    }
};

export const createList = async (listData) => {
    try {
        const newList = {
            id: uuidv4(),
            tenantId: listData.tenantId,
            name: listData.name,
            description: listData.description || '',
            tags: listData.tags || '',
            metadata: listData.metadata || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [createdList] = await db.insert(lists).values(newList).returning();
        return createdList;
    } catch (error) {
        console.error('Error in createList:', error);
        throw error;
    }
};

export const updateList = async (listId, listData) => {
    try {
        const [updatedList] = await db
            .update(lists)
            .set({
                ...listData,
                updatedAt: new Date()
            })
            .where(eq(lists.id, listId))
            .returning();
        return updatedList;
    } catch (error) {
        console.error('Error in updateList:', error);
        throw error;
    }
};

export const deleteList = async (listId) => {
    try {
        const [deletedList] = await db
            .delete(lists)
            .where(eq(lists.id, listId))
            .returning();
        return deletedList;
    } catch (error) {
        console.error('Error in deleteList:', error);
        throw error;
    }
};

export const getListById = async (listId) => {
    try {
        const [list] = await db
            .select()
            .from(lists)
            .where(eq(lists.id, listId));
        return list;
    } catch (error) {
        console.error('Error in getListById:', error);
        throw error;
    }
}; 