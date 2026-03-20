'use client';

import { useState, useMemo, useEffect } from 'react';
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
import Loader from '@/components/kokonutui/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contracts, categories, Contract } from '@/lib/contracts';
import { ContractModal } from './ContractModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useModal } from '@/lib/contexts/ModalContext';

export function ContractList() {
  const [searchQuery, setSearchQuery] = useLocalStorage<string>(
    'trackrights_contract_list_search',
    ''
  );
  const [selectedCategories, setSelectedCategories] = useLocalStorage<string[]>(
    'trackrights_contract_list_categories',
    []
  );
  const [selectedTags, setSelectedTags] = useLocalStorage<string[]>(
    'trackrights_contract_list_tags',
    []
  );
  const [expandedCategories, setExpandedCategories] = useLocalStorage<
    Record<string, boolean>
  >('trackrights_contract_list_expanded', {
    featured: true,
    producer: false,
    licensing: false,
    studio: false,
    creator: true,
    other: false,
  });
  const { modalState, openModal } = useModal();
  const [sortBy, setSortBy] = useLocalStorage<'title' | 'category'>(
    'trackrights_contract_list_sort',
    'title'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useLocalStorage<boolean>(
    'trackrights_contract_list_show_filters',
    false
  );

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

    // Use useEffect for side effects instead of useMemo
    return sorted;
  }, [searchQuery, selectedCategories, selectedTags, sortBy]);

  // Handle loading state separately
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timeoutId);
  }, [filteredAndSortedContracts]);

  const groupedContracts = useMemo(() => {
    return filteredAndSortedContracts.reduce(
      (acc, contract) => {
        const category = contract.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        if (acc[category]) {
          acc[category].push(contract);
        }
        return acc;
      },
      {} as Record<string, Contract[]>
    );
  }, [filteredAndSortedContracts]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleViewContract = (contract: Contract) => {
    openModal(contract);
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
      <h2
        className="text-center mb-12"
        style={{
          color: 'transparent',
          WebkitTextStroke: '2px hsl(var(--primary))',
        }}
      >
        Generate a Contract Now
      </h2>

      <div className="mb-12 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 w-full border-2 border-border/50 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card/50 text-foreground transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 rounded-2xl border-2 h-12 px-6 transition-all ${
                showFilters
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-card border-border/50 hover:border-primary/50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Select
              value={sortBy}
              onValueChange={(value: 'title' | 'category') => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] h-12 rounded-2xl border-2 border-border/50 bg-card hover:border-primary/50 transition-all">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-muted/50 p-8 rounded-2xl border-2 border-border/30 shadow-inner"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="font-semibold mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                    Categories
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(categories).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center group cursor-pointer"
                        onClick={() => handleCategoryChange(key)}
                      >
                        <Checkbox
                          id={`category-${key}`}
                          checked={selectedCategories.includes(key)}
                          onCheckedChange={() => handleCategoryChange(key)}
                          className="rounded-md border-primary/30 group-hover:border-primary transition-colors"
                        />
                        <label
                          htmlFor={`category-${key}`}
                          className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? 'default' : 'outline'
                        }
                        className={`cursor-pointer rounded-full px-4 py-1 transition-all border-2 ${
                          selectedTags.includes(tag)
                            ? 'bg-primary border-primary shadow-md shadow-primary/20'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleTagChange(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-border/30">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader
            title="Loading Contracts"
            subtitle="Please wait..."
            size="md"
          />
        </div>
      ) : filteredAndSortedContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border"
        >
          No contracts found matching your search or filters.
        </motion.div>
      ) : (
        <>
          <p className="text-small text-muted-foreground mb-6 pl-2">
            Showing{' '}
            <span className="text-foreground font-semibold">
              {filteredAndSortedContracts.length}
            </span>{' '}
            result
            {filteredAndSortedContracts.length !== 1 ? 's' : ''}
          </p>
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedContracts).map(
              ([category, categoryContracts]) => (
                <motion.div
                  key={category}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="mb-8"
                >
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-6 h-auto bg-card border border-border/50 hover:border-primary/30 rounded-2xl mb-4 group transition-all"
                  >
                    <h3 className="text-foreground group-hover:text-primary transition-colors m-0">
                      {categories[category as keyof typeof categories]}
                    </h3>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary font-medium border-none"
                      >
                        {categoryContracts.length}
                      </Badge>
                      {expandedCategories[category] ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      )}
                    </div>
                  </Button>

                  <AnimatePresence>
                    {expandedCategories[category] && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid gap-4 pl-4 md:pl-8 border-l-2 border-primary/10 ml-4"
                      >
                        {categoryContracts.map((contract) => (
                          <motion.div
                            key={contract.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                              <div className="flex items-start space-x-4">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                  <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-foreground m-0 group-hover:text-primary transition-colors">
                                    {contract.title}
                                  </h4>
                                  <p className="text-muted-foreground mt-2 leading-relaxed">
                                    {contract.description}
                                  </p>
                                  {contract.tags && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {contract.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="bg-muted text-muted-foreground text-[10px] uppercase tracking-wider font-bold border-none"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="lg"
                                variant="outline"
                                onClick={() => handleViewContract(contract)}
                                className="w-full sm:w-auto rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all group-hover:shadow-lg shadow-primary/20 font-bold"
                              >
                                View Contract
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

      {modalState.isOpen && <ContractModal />}
    </div>
  );
}
