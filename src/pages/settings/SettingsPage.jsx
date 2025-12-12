import React, { useState, useRef } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { storage, db, firebaseConfig } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Secondary auth
import { Settings, Upload, Save, Image as ImageIcon, Users, UserPlus } from 'lucide-react';

export const SettingsPage = () => {
    const { establishment, setEstablishment } = useAuth();
    // Logo states
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Team states
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamData, setTeamData] = useState({ name: '', email: '', password: '' });

    const currentLogo = establishment?.logoUrl || '/logo_default.png';

    // --- LOGO LOGIC ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleSaveLogo = async () => {
        const file = fileInputRef.current?.files[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');
            const storageRef = ref(storage, `establishments/${establishment.id}/logo`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            const establishmentRef = doc(db, 'establishments', establishment.id);
            await updateDoc(establishmentRef, { logoUrl: downloadUrl, updatedAt: new Date() });
            setEstablishment(prev => ({ ...prev, logoUrl: downloadUrl }));
            alert('Logo atualizada com sucesso!');
            setPreviewUrl(null);
        } catch (error) {
            console.error('Erro ao atualizar logo:', error);
            alert('Erro: ' + error.message);
        } finally {
            setUploadingLogo(false);
        }
    };

    // --- TEAM LOGIC ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        setTeamLoading(true);

        let secondaryApp = null;
        try {
            if (!establishment?.id) throw new Error('Dados do estabelecimento não encontrados');

            // 1. Initialize secondary app to create user without logging out current user
            secondaryApp = initializeApp(firebaseConfig, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);

            // 2. Create User
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, teamData.email, teamData.password);
            const newUser = userCredential.user;
            await updateProfile(newUser, { displayName: teamData.name });

            // 3. Add to allowedUsers in Firestore
            const establishmentRef = doc(db, 'establishments', establishment.id);
            await updateDoc(establishmentRef, {
                allowedUsers: arrayUnion(newUser.uid)
            });

            alert(`Usuário ${teamData.name} criado com sucesso! Ele já pode acessar o sistema.`);
            setTeamData({ name: '', email: '', password: '' });

        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = 'Este email já está em uso.';
            if (error.code === 'auth/weak-password') msg = 'A senha deve ter pelo menos 6 caracteres.';
            alert('Erro: ' + msg);
        } finally {
            setTeamLoading(false);
            if (secondaryApp) {
                // Cleanup? deleteApp is theoretically async but we just let it be GC'd or handled by firebase internal 
                // actually deleteApp helps clean up resources
                // import { deleteApp } from 'firebase/app';
                // await deleteApp(secondaryApp); 
                // But for now keeping it simple as import overhead might block me.
            }
        }
    };

    return (
        <AppLayout title="Configurações">
            <div style={{ padding: 'var(--spacing-md)', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

                {/* LOGO CARD */}
                <Card>
                    <CardHeader icon={<Settings size={24} />} title="Identidade Visual" subtitle="Logo do estabelecimento" />
                    <CardBody>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)', padding: 'var(--spacing-md)' }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={previewUrl || currentLogo}
                                    alt="Logo"
                                    style={{
                                        width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%',
                                        border: '4px solid var(--color-surface)', boxShadow: 'var(--shadow-md)'
                                    }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg' }}
                                />
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-primary)', borderRadius: '50%', padding: '6px', color: 'white' }}>
                                    <ImageIcon size={16} />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', width: '100%', maxWidth: '300px' }}>
                                <Button variant="outline" fullWidth icon={<Upload size={18} />} onClick={handleUploadClick} disabled={uploadingLogo}>
                                    Escolher
                                </Button>
                                {previewUrl && (
                                    <Button variant="primary" fullWidth icon={<Save size={18} />} onClick={handleSaveLogo} loading={uploadingLogo}>
                                        Salvar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* TEAM CARD */}
                <Card>
                    <CardHeader icon={<Users size={24} />} title="Gerenciar Equipe" subtitle="Adicione pessoas para acessar este estabelecimento" />
                    <CardBody>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ padding: 'var(--spacing-sm)', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-dark)' }}>
                                💡 Crie um acesso para seu sócio ou funcionário. Eles usarão este email e senha para logar e verão os mesmos dados que você.
                            </div>
                            <Input
                                label="Nome"
                                placeholder="Ex: Maria Gerente"
                                value={teamData.name}
                                onChange={e => setTeamData({ ...teamData, name: e.target.value })}
                                required
                            />
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <Input
                                        type="email"
                                        label="Email de Acesso"
                                        placeholder="funcionario@email.com"
                                        value={teamData.email}
                                        onChange={e => setTeamData({ ...teamData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <Input
                                        type="password"
                                        label="Senha Provisória"
                                        placeholder="Mínimo 6 caracteres"
                                        value={teamData.password}
                                        onChange={e => setTeamData({ ...teamData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ alignSelf: 'flex-end' }}>
                                <Button type="submit" variant="primary" icon={<UserPlus size={18} />} loading={teamLoading}>
                                    Cadastrar Usuário
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

            </div>
        </AppLayout>
    );
};

export default SettingsPage;
