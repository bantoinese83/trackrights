'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  Printer,
  Search,
  RotateCw,
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfData: string;
}

export default function PDFViewer({ pdfData }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults] = useState<{ pageIndex: number; matchIndex: number }[]>(
    []
  );
  const [, setCurrentSearchIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({
      numPages,
      pdfDocument,
    }: {
      numPages: number;
      pdfDocument: PDFDocumentProxy;
    }) => {
      setNumPages(numPages);
      setPageNumber(1);
      pdfDocumentRef.current = pdfDocument;
    },
    []
  );

  const changePage = useCallback(
    (offset: number) => {
      setPageNumber((prevPageNumber) =>
        Math.min(Math.max(1, prevPageNumber + offset), numPages ?? 1)
      );
    },
    [numPages]
  );

  const zoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  }, []);

  const rotate = useCallback(() => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    const linkSource = `data:application/pdf;base64,${pdfData}`;
    const downloadLink = document.createElement('a');
    const fileName = 'document.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }, [pdfData]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        `<iframe src="data:application/pdf;base64,${pdfData}" width="100%" height="100%"></iframe>`
      );
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }, [pdfData]);

  const handleSearch = useCallback(() => {
    // Implement search functionality if needed
  }, []);

  const nextSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % searchResults.length;
      const result = searchResults[newIndex];
      setPageNumber(result.pageIndex + 1);
      return newIndex;
    });
  }, [searchResults]);

  const prevSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prevIndex) => {
      const newIndex =
        (prevIndex - 1 + searchResults.length) % searchResults.length;
      const result = searchResults[newIndex];
      setPageNumber(result.pageIndex + 1);
      return newIndex;
    });
  }, [searchResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        changePage(-1);
      } else if (e.key === 'ArrowRight') {
        changePage(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage]);

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        Error loading PDF viewer. Please try again later.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={`flex flex-col items-center w-full ${isFullscreen ? 'fixed inset-0 bg-white z-50' : ''}`}
      >
        <div className="w-full bg-gray-100 p-2 sm:p-4 mb-2 sm:mb-4 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                    aria-label="Previous page"
                    className="p-1 sm:p-2"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous page</TooltipContent>
              </Tooltip>
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  min={1}
                  max={numPages ?? 1}
                  value={pageNumber}
                  onChange={(e) =>
                    setPageNumber(
                      Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        numPages ?? 1
                      )
                    )
                  }
                  className="w-12 sm:w-16 text-center text-xs sm:text-sm"
                  aria-label="Current page"
                />
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  of {numPages}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(1)}
                    disabled={pageNumber >= (numPages ?? 1)}
                    aria-label="Next page"
                    className="p-1 sm:p-2"
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next page</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                    className="p-1 sm:p-2"
                  >
                    <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
              <Slider
                value={[scale]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={([value]) => setScale(value)}
                className="w-20 sm:w-32"
                aria-label="Zoom level"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                    className="p-1 sm:p-2"
                  >
                    <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotate}
                    aria-label="Rotate"
                    className="p-1 sm:p-2"
                  >
                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    aria-label="Download PDF"
                    className="p-1 sm:p-2"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    aria-label="Print PDF"
                    className="p-1 sm:p-2"
                  >
                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print PDF</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                    className="p-1 sm:p-2"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle fullscreen</TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Input
                type="text"
                placeholder="Search in document"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-auto flex-grow text-xs sm:text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearch}
                className="p-1 sm:p-2"
              >
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={prevSearchResult}
                disabled={searchResults.length === 0}
                className="text-xs sm:text-sm p-1 sm:p-2"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSearchResult}
                disabled={searchResults.length === 0}
                className="text-xs sm:text-sm p-1 sm:p-2"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <div
          className={`overflow-auto ${isFullscreen ? 'h-full w-full' : 'h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] w-full'}`}
        >
          <Document
            file={`data:application/pdf;base64,${pdfData}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error: Error) => setError(error)}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            }
            error={
              <div className="text-red-600 p-4 text-center">
                Error loading PDF. Please make sure it&#39;s a valid PDF file.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mx-auto max-w-full"
            />
          </Document>
        </div>
      </div>
    </TooltipProvider>
  );
}
