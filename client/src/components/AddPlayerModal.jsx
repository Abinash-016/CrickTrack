import { useState } from 'react';
import api from '../api';

export default function AddPlayerModal({ onClose }) {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!name) return alert('Enter player name');

        try {
            setLoading(true);

            await api.post('/players/create', { name, avatar });

            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add player');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Add Player</h3>

                {/* Name Input */}
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Player name"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-4"
                />

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    id="playerImage"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setAvatar(reader.result);
                            setPreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                    }}
                />

                {/* Button */}
                <label
                    htmlFor="playerImage"
                    className="cursor-pointer block text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded mb-3"
                >
                    {preview ? 'Change Photo' : 'Choose Photo'}
                </label>

                {/* Preview */}
                {preview && (
                    <div className="flex justify-center mb-3">
                        <img
                            src={preview}
                            alt="preview"
                            className="w-16 h-16 rounded-full object-cover border"
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-slate-700 py-2 rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        className="flex-1 bg-green-600 py-2 rounded text-white disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}