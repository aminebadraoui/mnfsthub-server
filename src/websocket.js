const WebSocket = require('ws');
const baserowService = require('./services/baserow.service');

class WebSocketServer {
    constructor() {
        this.wss = null;
        this.processingLists = new Map();
    }

    initialize(server, options = {}) {
        this.wss = new WebSocket.Server({
            ...options
        });

        console.log('WebSocket server initialized');

        this.wss.on('connection', (ws, req) => {
            console.log('Client connected from:', req.headers.origin);

            // Send a welcome message
            ws.send(JSON.stringify({
                type: 'CONNECTED',
                message: 'Successfully connected to WebSocket server'
            }));

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    console.log('Received message:', data);
                    await this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Error handling message:', error);
                    ws.send(JSON.stringify({
                        type: 'LIST_PROCESSING_ERROR',
                        error: error.message
                    }));
                }
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            ws.on('close', (code, reason) => {
                console.log('Client disconnected. Code:', code, 'Reason:', reason);
            });
        });
    }

    async handleMessage(ws, data) {
        switch (data.type) {
            case 'START_LIST_PROCESSING':
                await this.handleStartListProcessing(ws, data);
                break;

            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    async handleStartListProcessing(ws, data) {
        const { listName, listTags, tenantId, normalizedData } = data;

        try {
            // Send started message
            ws.send(JSON.stringify({
                type: 'LIST_PROCESSING_STARTED',
                listName,
                timestamp: new Date().toISOString()
            }));

            if (!normalizedData?.list || !Array.isArray(normalizedData.list)) {
                throw new Error('Invalid normalized data format');
            }

            const total = normalizedData.list.length;
            let processed = 0;
            let addedCount = 0;
            let duplicateCount = 0;

            // Process contacts in batches
            for (const contact of normalizedData.list) {
                try {
                    const contactData = {
                        'Tenant_ID': tenantId,
                        'Full name': contact['Full name'] || contact['Full Name'] || '',
                        'First n': contact['First name'] || contact['First Name'] || '',
                        'Last': contact['Last name'] || contact['Last Name'] || '',
                        'Location': contact['Location'] || '',
                        'Job title': contact['Job title'] || contact['Job Title'] || '',
                        'Company': contact['Company'] || '',
                        'Email': contact['Email'] || '',
                        'Phone': contact['Phone'] || '',
                        'LinkedIn': contact['LinkedIn'] || contact['Linkedin'] || '',
                        'Instagram': contact['Instagram'] || '',
                        'Facebook': contact['Facebook'] || '',
                        'Twitter': contact['Twitter'] || '',
                        'Industry': contact['Industry'] || '',
                        'List_Name': listName,
                        'Tags': listTags,
                        'Active': true
                    };

                    // Check for duplicates
                    if (contact.Email && contact.Email !== 'N/A') {
                        const existingContacts = await baserowService.getContacts({
                            filters: {
                                'Tenant_ID': tenantId,
                                'Email': contact.Email
                            }
                        });

                        if (existingContacts.count === 0) {
                            await baserowService.createContact(contactData);
                            addedCount++;
                        } else {
                            duplicateCount++;
                        }
                    } else {
                        await baserowService.createContact(contactData);
                        addedCount++;
                    }

                    processed++;

                    // Send progress update every 5 contacts or at 100%
                    if (processed % 5 === 0 || processed === total) {
                        ws.send(JSON.stringify({
                            type: 'LIST_PROCESSING_PROGRESS',
                            listName,
                            processed,
                            total,
                            timestamp: new Date().toISOString()
                        }));
                    }
                } catch (error) {
                    console.error('Error processing contact:', error);
                }
            }

            // Send completion message
            ws.send(JSON.stringify({
                type: 'LIST_PROCESSING_COMPLETED',
                listName,
                addedCount,
                duplicateCount,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error processing list:', error);
            ws.send(JSON.stringify({
                type: 'LIST_PROCESSING_ERROR',
                listName,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
        }
    }

    broadcast(message) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

const wsServer = new WebSocketServer();
module.exports = wsServer; 