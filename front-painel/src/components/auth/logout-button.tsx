"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } finally {
            router.replace("/login");
            router.refresh();
        }
    };

    return (
        <button type="button" onClick={handleLogout}>
            Sair
        </button>
    );
}
