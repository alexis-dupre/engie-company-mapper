/**
 * Page de création d'un nouveau groupe
 */

import { GroupUploadForm } from '@/components/admin/GroupUploadForm';

export default function NewGroupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nouveau Groupe
        </h1>
        <p className="text-gray-600 mb-8">
          Uploadez un fichier JSON pour créer un nouveau groupe d'entreprises
        </p>

        <GroupUploadForm />
      </div>
    </div>
  );
}
