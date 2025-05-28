import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}
export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  return {
    currentPage,
    totalPages,
    onPageChange,
    paginatedItems: {
      startIndex,
      endIndex
    }
  };
}