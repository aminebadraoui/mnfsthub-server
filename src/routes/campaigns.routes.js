import express from 'express';
import { getCampaigns, createCampaign, getCampaignById, updateCampaign, deleteCampaign } from '../services/campaigns.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all campaigns
router.get('/', async (req, res) => {
    try {
        // Use the tenantId from the decoded token
        const campaigns = await getCampaigns({ tenantId: req.user.tenantId });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new campaign
router.post('/', async (req, res) => {
    try {
        // Add tenantId from the decoded token
        const campaignData = {
            ...req.body,
            tenantId: req.user.tenantId
        };
        const campaign = await createCampaign(campaignData);
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const campaign = await getCampaignById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        // Check if the campaign belongs to the user's tenant
        if (campaign.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a campaign
router.put('/:id', async (req, res) => {
    try {
        const campaign = await getCampaignById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        // Check if the campaign belongs to the user's tenant
        if (campaign.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const updatedCampaign = await updateCampaign(req.params.id, req.body);
        res.json(updatedCampaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaign = await getCampaignById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        // Check if the campaign belongs to the user's tenant
        if (campaign.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const success = await deleteCampaign(req.params.id);
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 