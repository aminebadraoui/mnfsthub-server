import express from 'express';
import { getContacts, createContact, getContactById, updateContact, deleteContact, addContactsToList } from '../services/contacts.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all contacts
router.get('/', async (req, res) => {
    try {
        // Use the tenantId from the decoded token
        const contacts = await getContacts({ tenantId: req.user.tenantId });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new contact
router.post('/', async (req, res) => {
    try {
        // Add tenantId from the decoded token
        const contactData = {
            ...req.body,
            tenantId: req.user.tenantId
        };
        const contact = await createContact(contactData);
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a contact by ID
router.get('/:id', async (req, res) => {
    try {
        const contact = await getContactById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        // Check if the contact belongs to the user's tenant
        if (contact.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a contact
router.put('/:id', async (req, res) => {
    try {
        const contact = await getContactById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        // Check if the contact belongs to the user's tenant
        if (contact.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const updatedContact = await updateContact(req.params.id, req.body);
        res.json(updatedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
    try {
        const contact = await getContactById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        // Check if the contact belongs to the user's tenant
        if (contact.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const success = await deleteContact(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create multiple contacts in batch
router.post('/batch', async (req, res) => {
    try {
        const { contacts, defaultJobTitle, defaultLocation } = req.body;
        const defaultValues = {
            jobTitle: defaultJobTitle,
            location: defaultLocation
        };

        const createdContacts = await addContactsToList(contacts, defaultValues);
        res.status(201).json(createdContacts);
    } catch (error) {
        console.error('Error in batch contact creation:', error);
        res.status(500).json({ error: 'Failed to create contacts' });
    }
});

export default router; 