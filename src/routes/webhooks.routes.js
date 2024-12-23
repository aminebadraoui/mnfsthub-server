import express from 'express';
import { createWorkflow, updateWorkflowStatus, WorkflowType, WorkflowStatus, getWorkflowsByTenant, getWorkflowsByType } from '../services/workflowService.js';
import fetch from 'node-fetch';

const router = express.Router();
const N8N_API_URL = 'https://mnfst-n8n.mnfstagency.com/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNThhMTg1NS1hODQ3LTQyMzAtOTgzYi1hZWU1MGIyOTNlYjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzM0OTA5ODU4fQ.gFiQ9DjlEasQo5jCCB4wWF7Uc58NPeQDVmJXTL_u_78';

// Webhook endpoint for n8n to send search results
router.post('/search/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, data, error } = req.body;

        // Update workflow status based on n8n response
        await updateWorkflowStatus(
            jobId,
            status === 'success' ? WorkflowStatus.COMPLETED : WorkflowStatus.FAILED,
            data,
            error
        );

        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        console.error('Error processing search webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook endpoint for n8n to send list processing results
router.post('/lists/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, data, error } = req.body;

        // Update workflow status based on n8n response
        await updateWorkflowStatus(
            jobId,
            status === 'success' ? WorkflowStatus.COMPLETED : WorkflowStatus.FAILED,
            data,
            error
        );

        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        console.error('Error processing list webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to create a new search workflow
router.post('/outreach/search', async (req, res) => {
    try {
        const { tenantId, jobTitle, location, channel } = req.body;

        // Create a new workflow record
        const workflow = await createWorkflow({
            tenantId,
            type: WorkflowType.SEARCH,
            name: `Search: ${jobTitle} in ${location}`,
            params: { jobTitle, location, channel }
        });

        // Forward the request to n8n
        const n8nResponse = await fetch('https://mnfst-n8n.mnfstagency.com/webhook/outreach/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...req.body,
                jobId: workflow.id
            })
        });

        if (!n8nResponse.ok) {
            throw new Error('Failed to send data to n8n');
        }

        const n8nData = await n8nResponse.json();
        res.status(200).json({
            message: 'Search workflow started',
            workflowId: workflow.id,
            n8nWorkflowId: n8nData.workflowId
        });
    } catch (error) {
        console.error('Error creating search workflow:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to create a new list workflow
router.post('/outreach/lists/add', async (req, res) => {
    try {
        const { tenantId, name, tags, defaultJobTitle, defaultLocation } = req.body;
        const file = req.files?.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a new workflow record
        const workflow = await createWorkflow({
            tenantId,
            type: WorkflowType.LIST,
            name: `List: ${name}`,
            params: { name, tags, defaultJobTitle, defaultLocation, fileName: file.name }
        });

        // Create FormData for n8n
        const formData = new FormData();
        formData.append('file', file.data, file.name);
        formData.append('name', name);
        formData.append('tags', JSON.stringify(tags));
        formData.append('defaultJobTitle', defaultJobTitle);
        formData.append('defaultLocation', defaultLocation);
        formData.append('jobId', workflow.id);

        // Forward the request to n8n
        const n8nResponse = await fetch('https://mnfst-n8n.mnfstagency.com/webhook/outreach/lists/add', {
            method: 'POST',
            body: formData
        });

        if (!n8nResponse.ok) {
            throw new Error('Failed to send data to n8n');
        }

        const n8nData = await n8nResponse.json();
        res.status(200).json({
            message: 'List workflow started',
            workflowId: workflow.id,
            n8nWorkflowId: n8nData.workflowId
        });
    } catch (error) {
        console.error('Error creating list workflow:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get workflows for a tenant
router.get('/workflows/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { type } = req.query;
        console.log('Fetching workflows for tenant:', tenantId, 'type:', type);

        const workflows = type
            ? await getWorkflowsByType(tenantId, type)
            : await getWorkflowsByTenant(tenantId);

        console.log('Found workflows:', workflows);
        res.status(200).json(workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get n8n execution data
router.get('/n8n/executions/:executionId', async (req, res) => {
    console.log('Received request for execution ID:', req.params.executionId);
    try {
        const { executionId } = req.params;
        const url = `${N8N_API_URL}/executions/${executionId}?includeData=true`;
        console.log('Making request to n8n:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY
            }
        });

        console.log('N8N response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error from n8n:', errorText);
            throw new Error('Failed to fetch execution data from n8n');
        }

        const data = await response.json();
        console.log('Successfully received data from n8n');
        res.json(data);
    } catch (error) {
        console.error('Error in n8n execution endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch execution data' });
    }
});

export default router; 