import { API_URL } from "../config/api";

export const AVATARS = [
    '/assets/avatars/Multiavatar-0bbf7d49e863432025.png',
    '/assets/avatars/Multiavatar-1593125f3419854463.png',
    '/assets/avatars/Multiavatar-17a81237eaddac789b.png',
    '/assets/avatars/Multiavatar-2468e3a8293b184639.png',
    '/assets/avatars/Multiavatar-2cf9de5100df77aed3.png',
    '/assets/avatars/Multiavatar-2d7dfeae6b62167b99.png',
    '/assets/avatars/Multiavatar-31992eebf6d8026034.png',
    '/assets/avatars/Multiavatar-36343766efdb988ba4.png',
    '/assets/avatars/Multiavatar-39f7bc53c52458f5c5.png',
    '/assets/avatars/Multiavatar-3e9cabf705e4dcdca6.png',
    '/assets/avatars/Multiavatar-3edf37e2b873192c7c.png',
    '/assets/avatars/Multiavatar-58b6d26948d3acd441.png',
    '/assets/avatars/Multiavatar-636c7b7ce7cec72503.png',
    '/assets/avatars/Multiavatar-636f20a5ae233f8177.png',
    '/assets/avatars/Multiavatar-6e31405b3c4525e656.png',
    '/assets/avatars/Multiavatar-6f6e1a71730995b6c7.png',
    '/assets/avatars/Multiavatar-79d6fd059b76ed94bf.png',
    '/assets/avatars/Multiavatar-8b9753850d85dc39f0.png',
    '/assets/avatars/Multiavatar-9348a1b0262646a309.png',
    '/assets/avatars/Multiavatar-a4a982b15fa0b5eddb.png',
    '/assets/avatars/Multiavatar-a7171f5ae110e70595.png',
    '/assets/avatars/Multiavatar-ae174f5f9f5a334b54.png',
    '/assets/avatars/Multiavatar-afb2bca4fd862f9e2e.png',
    '/assets/avatars/Multiavatar-b4bda0506d775e48e7.png',
    '/assets/avatars/Multiavatar-bc3ee20e433935bbcb.png',
    '/assets/avatars/Multiavatar-cd50503971acbd0791.png',
    '/assets/avatars/Multiavatar-d2ed96214209651e22.png',
    '/assets/avatars/Multiavatar-d7c3a1e2b4070af233.png',
    '/assets/avatars/Multiavatar-e3d21ed62a34ac4f49.png',
    '/assets/avatars/Multiavatar-e69fc3d59b2cdbc6ef.png',
    '/assets/avatars/Multiavatar-eab5911539d9bed30f.png',
    '/assets/avatars/Multiavatar-f843136cf9d908a7a4.png',
    '/assets/avatars/Multiavatar-fc7071de7fa90196d4.png',
];

/**
 * Resuelve la URL completa del avatar.
 * @param {string} path - Ruta de la imagen (puede ser /assets/... o /user-pics/...)
 * @returns {string} URL completa
 */
export const getAvatarUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=User&background=random"; // Fallback por defecto

    if (path.startsWith('http')) return path; // Si ya es una URL completa (ej. Google Auth)

    if (path.startsWith('/assets')) {
        return path; // Archivos estáticos del frontend
    }

    // Archivos subidos al backend
    return `${API_URL}${path}`;
};
