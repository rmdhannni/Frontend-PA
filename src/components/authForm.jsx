import React from 'react';

const AuthForm = ({ type, onSubmit, formData, setFormData }) => {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <input type="text" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">{type === 'login' ? 'Login' : 'Register'}</button>
        </form>
    );
};

export default AuthForm;