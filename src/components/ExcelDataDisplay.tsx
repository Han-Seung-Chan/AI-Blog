"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExcelRowData } from "@/app/api/excel/route";

interface ExcelDataDisplayProps {
  data: ExcelRowData[];
  onDataSelect?: (selectedData: ExcelRowData) => void;
}

export function ExcelDataDisplay({
  data,
  onDataSelect,
}: ExcelDataDisplayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // 컬럼 헤더 추출
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [data, searchTerm]);

  // 페이지네이션 적용
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage]);

  // 총 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 데이터가 없는 경우 처리
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>엑셀 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            데이터가 없습니다. 엑셀 파일을 업로드하세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>엑셀 데이터 ({filteredData.length}개 항목)</span>
          <div className="w-1/3">
            <Input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색 시 첫 페이지로 리셋
              }}
              className="w-full"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted border-b">
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left text-sm font-medium"
                  >
                    {column}
                  </th>
                ))}
                {onDataSelect && (
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    액션
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-muted/50 border-b">
                    {columns.map((column, colIdx) => (
                      <td
                        key={`${rowIdx}-${colIdx}`}
                        className="px-4 py-2 text-sm"
                      >
                        {row[column] !== null ? String(row[column]) : ""}
                      </td>
                    ))}
                    {onDataSelect && (
                      <td className="px-4 py-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onDataSelect(row)}
                        >
                          선택
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (onDataSelect ? 1 : 0)}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              총 {filteredData.length}개 중{" "}
              {(currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredData.length)}개 표시
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
