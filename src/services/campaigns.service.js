import { db } from '../db/index.js';
import { campaigns } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const getCampaigns = async (filters = {}) => {
    try {
        let query = db.select().from(campaigns);

        if (filters.tenantId) {
            query = query.where(eq(campaigns.tenantId, filters.tenantId));
        }

        return await query;
    } catch (error) {
        console.error('Error in getCampaigns:', error);
        throw error;
    }
};

export const createCampaign = async (campaignData) => {
    try {
        const newCampaign = {
            id: uuidv4(),
            uuid: uuidv4(),
            tenantId: campaignData.tenantId,
            name: campaignData.name,
            description: campaignData.description || '',
            listId: campaignData.listId,
            channels: campaignData.channels || '',
            status: campaignData.status || 'draft',
            metadata: campaignData.metadata || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [createdCampaign] = await db.insert(campaigns).values(newCampaign).returning();
        return createdCampaign;
    } catch (error) {
        console.error('Error in createCampaign:', error);
        throw error;
    }
};

export const updateCampaign = async (campaignId, campaignData) => {
    try {
        const [updatedCampaign] = await db
            .update(campaigns)
            .set({
                ...campaignData,
                updatedAt: new Date()
            })
            .where(eq(campaigns.id, campaignId))
            .returning();
        return updatedCampaign;
    } catch (error) {
        console.error('Error in updateCampaign:', error);
        throw error;
    }
};

export const deleteCampaign = async (campaignId) => {
    try {
        const [deletedCampaign] = await db
            .delete(campaigns)
            .where(eq(campaigns.id, campaignId))
            .returning();
        return deletedCampaign;
    } catch (error) {
        console.error('Error in deleteCampaign:', error);
        throw error;
    }
};

export const getCampaignById = async (campaignId) => {
    try {
        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, campaignId));
        return campaign;
    } catch (error) {
        console.error('Error in getCampaignById:', error);
        throw error;
    }
}; 