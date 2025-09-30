'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DatabaseRedirect() {
    const params = useParams();
    const router = useRouter();
    const dbId = params.dbId as string;

    useEffect(() => {
        if (dbId) {
            router.replace(`/${dbId}/books`);
        }
    }, [dbId, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your reading tracker...</p>
            </div>
        </div>
    );
}
