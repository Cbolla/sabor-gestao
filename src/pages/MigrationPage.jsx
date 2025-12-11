import React, { useState } from 'react';
import { Database, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { dbService } from '../services/db.service';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';
import { signInAnonymously } from 'firebase/auth'; // Import Auth
import { auth } from '../services/firebase'; // Import auth instance

export const MigrationPage = () => {
    const { establishment } = useAuth();
    const [status, setStatus] = useState('idle'); // idle, working, success, error
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const handleMigration = async () => {
        if (!establishment?.id) {
            addLog('Error: No establishment found. Please login.');
            return;
        }

        if (!window.confirm('Isso irá copiar todos os dados locais para o Google Firebase. Continuar?')) return;

        setStatus('working');
        setLogs([]);
        setProgress(0);

        try {
            addLog('Starting migration...');

            // Authenticate purely for migration access
            try {
                addLog('Authenticating with cloud database...');
                await signInAnonymously(auth);
                addLog('Authenticated successfully.');
            } catch (authError) {
                // Ignore if already signed in, or log error
                addLog('Auth note: ' + authError.message);
            }

            // 1. Customers
            addLog('Reading customers from local DB...');
            const customers = await dbService.getDocuments('customers', { where: { field: 'establishmentId', value: establishment.id } });
            addLog(`Found ${customers.length} customers.`);

            for (let i = 0; i < customers.length; i++) {
                const c = customers[i];
                // Use original ID if possible, or let Firestore generate? 
                // Better to let Firestore generate and update references? Or keep ID?
                // Keeping numeric ID in Firestore is weird but possible as string. 
                // BUT better to issue new IDs and map them? No, that breaks everything.
                // Let's use the numeric ID as the Document ID (stringified).
                await firestoreService.setDocument(`establishments/${establishment.id}/customers`, String(c.id), c);
                setProgress(prev => prev + 1);
            }
            addLog('Customers migrated.');

            // 2. Products
            addLog('Reading products...');
            const products = await dbService.getDocuments('products', { where: { field: 'establishmentId', value: establishment.id } });
            addLog(`Found ${products.length} products.`);
            for (let p of products) {
                await firestoreService.setDocument(`establishments/${establishment.id}/products`, String(p.id), p);
            }
            addLog('Products migrated.');

            // 3. Orders
            addLog('Reading orders...');
            const orders = await dbService.getDocuments('orders', { where: { field: 'establishmentId', value: establishment.id } });
            addLog(`Found ${orders.length} orders.`);
            for (let o of orders) {
                await firestoreService.setDocument(`establishments/${establishment.id}/orders`, String(o.id), o);
            }
            addLog('Orders migrated.');

            // 4. Expenses
            addLog('Reading expenses...');
            try {
                const expenses = await dbService.getDocuments('expenses', { where: { field: 'establishmentId', value: establishment.id } });
                addLog(`Found ${expenses.length} expenses.`);
                for (let e of expenses) {
                    await firestoreService.setDocument(`establishments/${establishment.id}/expenses`, String(e.id), e);

                    // Installments
                    const installments = await dbService.getDocuments('installments', { where: { field: 'expenseId', value: e.id } });
                    for (let inst of installments) {
                        await firestoreService.setDocument(`establishments/${establishment.id}/expenses/${e.id}/installments`, String(inst.id), inst);
                    }
                }
                addLog('Expenses migrated.');
            } catch (e) {
                addLog('No expenses table or error: ' + e.message);
            }

            setStatus('success');
            addLog('MIGRATION COMPLETED SUCCESSFULLY!');
            addLog('You can now switch to using Firebase.');

        } catch (error) {
            console.error(error);
            setStatus('error');
            addLog('Error: ' + error.message);
        }
    };

    return (
        <AppLayout title="Migração de Dados">
            <div style={{ padding: 'var(--spacing-md)' }}>
                <Card>
                    <CardHeader
                        icon={<Database size={24} />}
                        title="Migrar para Firebase"
                        subtitle="Copiar dados locais para a nuvem"
                    />
                    <CardBody>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <p>Esta ferramenta fará o backup dos seus dados locais (Dexie) e os enviará para o banco de dados Firebase.</p>
                            <p><strong>Atenção:</strong> Certifique-se de estar conectado à internet.</p>
                        </div>

                        {status === 'idle' && (
                            <Button variant="primary" onClick={handleMigration} icon={<Upload size={20} />}>
                                Iniciar Migração
                            </Button>
                        )}

                        {status === 'working' && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ marginBottom: '10px' }}>Processando...</div>
                                {/* Simple spinner or progress could go here */}
                            </div>
                        )}

                        {status === 'success' && (
                            <div style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={24} /> Migração concluída com sucesso!
                            </div>
                        )}

                        {status === 'error' && (
                            <div style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <AlertTriangle size={24} /> Erro durante a migração.
                            </div>
                        )}

                        <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}>
                            {logs.map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
};

export default MigrationPage;
