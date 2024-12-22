import { db } from '../db/index.js';
import { contacts } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const computeAvailableChannels = (contact) => {
    const channels = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:\+\d{1,3}[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;
    const urlRegex = /^https?:\/\/.+/i;

    if (contact.email && contact.email !== 'N/A' && emailRegex.test(contact.email)) {
        channels.push('email');
    }

    if (contact.phone && contact.phone !== 'N/A' && phoneRegex.test(contact.phone)) {
        channels.push('phone');
    }

    if (contact.linkedin && contact.linkedin !== 'N/A' && urlRegex.test(contact.linkedin)) {
        channels.push('linkedin');
    }

    if (contact.instagram && contact.instagram !== 'N/A' && urlRegex.test(contact.instagram)) {
        channels.push('instagram');
    }

    if (contact.facebook && contact.facebook !== 'N/A' && urlRegex.test(contact.facebook)) {
        channels.push('facebook');
    }

    if (contact.twitter && contact.twitter !== 'N/A' && urlRegex.test(contact.twitter)) {
        channels.push('twitter');
    }

    if (contact.tiktok && contact.tiktok !== 'N/A' && urlRegex.test(contact.tiktok)) {
        channels.push('tiktok');
    }

    if (contact.whatsapp && contact.whatsapp !== 'N/A' && whatsappRegex.test(contact.whatsapp)) {
        channels.push('whatsapp');
    }

    return channels;
};

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

export const addContactsToList = async (contactsData, defaultValues = {}) => {
    try {
        console.log('Received default values:', defaultValues);
        console.log('Sample contact data:', contactsData[0]);

        const newContacts = contactsData.map(contact => {
            const availableChannels = computeAvailableChannels(contact);

            // Log the processing of location and job title for the first contact
            if (contact === contactsData[0]) {
                console.log('Processing first contact:');
                console.log('Location:', {
                    original: contact.location,
                    default: defaultValues.location,
                    final: (contact.location === 'N/A' ? defaultValues.location : contact.location) || defaultValues.location || ''
                });
                console.log('Job Title:', {
                    original: contact.jobTitle,
                    default: defaultValues.jobTitle,
                    final: (contact.jobTitle === 'N/A' ? defaultValues.jobTitle : contact.jobTitle) || defaultValues.jobTitle || ''
                });
            }

            return {
                id: uuidv4(),
                tenantId: contact.tenant_id,
                listId: contact.list_id,
                listName: contact.list_name,
                fullName: contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                location: (contact.location === 'N/A' ? defaultValues.location : contact.location) || defaultValues.location || '',
                jobTitle: (contact.jobTitle === 'N/A' ? defaultValues.jobTitle : contact.jobTitle) || defaultValues.jobTitle || '',
                company: contact.company || '',
                email: contact.email || '',
                phone: contact.phone || '',
                linkedin: contact.linkedin || '',
                facebook: contact.facebook || '',
                twitter: contact.twitter || '',
                instagram: contact.instagram || '',
                whatsapp: contact.whatsapp || '',
                tiktok: contact.tiktok || '',
                employeeNumber: contact.employeeNumber || '',
                industry: contact.industry || '',
                campaigns: contact.campaigns || [],
                lastCampaign: contact.lastCampaign || null,
                contactChannels: contact.contactChannels || [],
                lastContactChannel: contact.lastContactChannel || '',
                lastContactedAt: contact.lastContactedAt || null,
                availableChannels: availableChannels,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        const createdContacts = await db.insert(contacts).values(newContacts).returning();
        return createdContacts;
    } catch (error) {
        console.error('Error in addContactsToList:', error);
        throw error;
    }
}; 