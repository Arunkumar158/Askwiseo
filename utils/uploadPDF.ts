import { storage, db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export const uploadPDF = async (
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<void> => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    toast.error('Please sign in to upload documents');
    router.push('/signin');
    return;
  }

  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    toast.error('File size exceeds 50MB limit');
    return;
  }

  if (file.type !== 'application/pdf') {
    toast.error('Only PDF files are allowed');
    return;
  }

  try {
    // Create a storage reference
    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for upload progress
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({ progress, status: 'uploading' });
      },
      (error) => {
        console.error('Upload error:', error);
        onProgress({ progress: 0, status: 'error' });
        toast.error('Failed to upload file');
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Add document metadata to Firestore
        await addDoc(collection(db, 'documents'), {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          uploadedBy: user.uid,
          uploadedAt: serverTimestamp(),
          status: 'processed'
        });

        onProgress({ progress: 100, status: 'success' });
        toast.success('File uploaded successfully');
      }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    onProgress({ progress: 0, status: 'error' });
    toast.error('Failed to upload file');
  }
}; 