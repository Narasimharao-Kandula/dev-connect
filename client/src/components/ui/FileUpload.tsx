import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
}

export default function FileUpload({ files, onFilesChange, accept, maxSize = 5 * 1024 * 1024, multiple = false, maxFiles = 1 }: FileUploadProps) {
  const onDrop = useCallback((accepted: File[]) => {
    onFilesChange(multiple ? [...files, ...accepted].slice(0, maxFiles) : accepted.slice(0, maxFiles));
  }, [files, onFilesChange, multiple, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxSize, multiple, maxFiles });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-[#6C4CF1] bg-[#6C4CF1]/5'
            : 'border-gray-200 dark:border-gray-700 hover:border-[#6C4CF1]/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
        }`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
        {isDragActive ? (
          <p className="text-sm text-[#6C4CF1] font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Drag & drop or <span className="text-[#6C4CF1]">browse</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max {maxSize / 1024 / 1024}MB per file</p>
          </>
        )}
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-[12px] px-3 py-2 border border-gray-100 dark:border-gray-800">
              <FiFile size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{(file.size / 1024).toFixed(0)}KB</span>
              <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Remove file">
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
