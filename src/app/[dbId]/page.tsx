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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your reading tracker...</p>
            </div>
        </div>
    );
}
