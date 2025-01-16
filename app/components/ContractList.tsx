'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contracts, categories, Contract } from '@/lib/contracts';
import { ContractModal } from './ContractModal';

export function ContractList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    featured: true,
    producer: false,
    licensing: false,
    studio: false,
    other: false,
  });
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [sortBy, setSortBy] = useState<'title' | 'category'>('title');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contracts.forEach((contract) => {
      contract.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);

  const filteredAndSortedContracts = useMemo(() => {
    setIsLoading(true);
    const filtered = contracts.filter((contract) => {
      const matchesSearch =
        contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        contract.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(contract.category);
      const matchesTags =
        selectedTags.length === 0 ||
        (contract.tags &&
          contract.tags.some((tag) => selectedTags.includes(tag)));
      return matchesSearch && matchesCategory && matchesTags;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    setTimeout(() => setIsLoading(false), 300); // Simulate loading delay
    return sorted;
  }, [searchQuery, selectedCategories, selectedTags, sortBy]);

  const groupedContracts = useMemo(() => {
    return filteredAndSortedContracts.reduce(
      (acc, contract) => {
        if (!acc[contract.category]) {
          acc[contract.category] = [];
        }
        acc[contract.category].push(contract);
        return acc;
      },
      {} as Record<string, Contract[]>
    );
  }, [filteredAndSortedContracts]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy('title');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Select
            value={sortBy}
            onValueChange={(value: 'title' | 'category') => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 p-4 rounded-md shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="space-y-2">
                    {Object.entries(categories).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <Checkbox
                          id={`category-${key}`}
                          checked={selectedCategories.includes(key)}
                          onCheckedChange={() => handleCategoryChange(key)}
                        />
                        <label
                          htmlFor={`category-${key}`}
                          className="ml-2 text-sm"
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => handleTagChange(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="link" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredAndSortedContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          No contracts found matching your search or filters.
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredAndSortedContracts.length} result
            {filteredAndSortedContracts.length !== 1 ? 's' : ''}
          </p>
          <AnimatePresence>
            {Object.entries(groupedContracts).map(
              ([category, categoryContracts]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg mb-2"
                  >
                    <h2 className="text-lg font-semibold text-purple-900">
                      {categories[category as keyof typeof categories]}
                    </h2>
                    {expandedCategories[category] ? (
                      <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                  </Button>

                  <AnimatePresence>
                    {expandedCategories[category] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        {categoryContracts.map((contract) => (
                          <motion.div
                            key={contract.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                                <div>
                                  <h3 className="text-gray-900">
                                    {contract.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {contract.description}
                                  </p>
                                  {contract.tags && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {contract.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="bg-purple-100 text-purple-800"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewContract(contract)}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                View
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </>
      )}

      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}
