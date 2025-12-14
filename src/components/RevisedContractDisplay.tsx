'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, Download, Check, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from '@/lib/contexts/StateContext';

export function RevisedContractDisplay() {
  const { state, dispatch } = useAppState();
  const { revisedContract } = state;
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const { toast } = useToast();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!revisedContract) {
      setError('Failed to load the revised contract.');
    } else {
      setError(null);
      // Initialize edited content when contract loads
      if (!isEditing) {
        setEditedContent(revisedContract);
      }
    }
  }, [revisedContract, isEditing]);

  const handleCopy = async () => {
    if (!revisedContract) return;
    try {
      await navigator.clipboard.writeText(revisedContract);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Revised contract copied to clipboard',
      });
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const contentToDownload = isEditing ? editedContent : revisedContract;
    if (!contentToDownload) return;
    const blob = new Blob([contentToDownload], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revised-contract-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Revised contract saved to your downloads',
    });
  };

  const handleEdit = () => {
    if (revisedContract) {
      setEditedContent(revisedContract);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!editedContent.trim()) {
      toast({
        title: 'Error',
        description: 'Contract content cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: editedContent });
    setIsEditing(false);
    toast({
      title: 'Saved!',
      description: 'Revised contract has been updated',
    });
  };

  const handleCancel = () => {
    if (revisedContract) {
      setEditedContent(revisedContract);
    }
    setIsEditing(false);
  };

  if (error) {
    return (
      <motion.div
        className="mt-8 bg-red-100 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-red-800">
          Error
        </h3>
        <p className="text-red-700">{error}</p>
      </motion.div>
    );
  }

  if (!revisedContract) return null;

  return (
    <motion.div
      id="revised-contract"
      className="mt-8 bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-semibold text-purple-800">
          Revised Contract
        </h3>
        <TooltipProvider>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleEdit}
                      size="sm"
                      variant="outline"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit contract content</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      variant="outline"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-1" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      variant="outline"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download as markdown file</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save changes</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel editing</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      </div>
      {isEditing ? (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] font-mono text-xs sm:text-sm md:text-base resize-y border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50"
            placeholder="Edit your revised contract here..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Tip: You can edit the markdown content directly. Changes will be
            saved when you click &quot;Save&quot;.
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
          <ReactMarkdown
            className="prose max-w-none text-xs sm:text-sm md:text-base rounded-lg"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {revisedContract}
          </ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}
