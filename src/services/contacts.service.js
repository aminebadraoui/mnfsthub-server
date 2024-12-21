import { db } from '../db/index.js';
import { contacts } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const getContacts = async (filters = {}) => {
    try {
        let query = db.select().from(contacts);

        if (filters.listId) {
            query = query.where(eq(contacts.listId, filters.listId));
        }

        if (filters.tenantId) {
            query = query.where(eq(contacts.tenantId, filters.tenantId));
        }

        return await query;
    } catch (error) {
        console.error('Error in getContacts:', error);
        throw error;
    }
};

export const createContact = async (contactData) => {
    try {
        const newContact = {
            id: uuidv4(),
            tenantId: contactData.tenantId,
            listId: contactData.listId,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            email: contactData.email,
            phone: contactData.phone,
            channels: contactData.channels || '',
            campaigns: contactData.campaigns || '',
            lastCampaign: contactData.lastCampaign || '',
            metadata: contactData.metadata || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [createdContact] = await db.insert(contacts).values(newContact).returning();
        return createdContact;
    } catch (error) {
        console.error('Error in createContact:', error);
        throw error;
    }
};

export const updateContact = async (contactId, contactData) => {
    try {
        const [updatedContact] = await db
            .update(contacts)
            .set({
                ...contactData,
                updatedAt: new Date()
            })
            .where(eq(contacts.id, contactId))
            .returning();
        return updatedContact;
    } catch (error) {
        console.error('Error in updateContact:', error);
        throw error;
    }
};

export const deleteContact = async (contactId) => {
    try {
        const [deletedContact] = await db
            .delete(contacts)
            .where(eq(contacts.id, contactId))
            .returning();
        return deletedContact;
    } catch (error) {
        console.error('Error in deleteContact:', error);
        throw error;
    }
};

export const getContactById = async (contactId) => {
    try {
        const [contact] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, contactId));
        return contact;
    } catch (error) {
        console.error('Error in getContactById:', error);
        throw error;
    }
};

export const addContactsToList = async (listId, contactsData) => {
    try {
        const newContacts = contactsData.map(contact => ({
            id: uuidv4(),
            listId,
            tenantId: contact.tenantId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            channels: contact.channels || '',
            campaigns: contact.campaigns || '',
            lastCampaign: contact.lastCampaign || '',
            metadata: contact.metadata || '',
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const createdContacts = await db.insert(contacts).values(newContacts).returning();
        return createdContacts;
    } catch (error) {
        console.error('Error in addContactsToList:', error);
        throw error;
    }
}; 