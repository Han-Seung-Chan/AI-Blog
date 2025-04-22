"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "@/services/admin/admin-service";
import { User } from "@/types/auth";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllUsers();
        setUsers(data);
      } catch (err: any) {
        console.error("사용자 목록 조회 오류:", err);
        setError("사용자 목록을 가져오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      users.map((user) => ({
        이름: user.name || "",
        이메일: user.email || "",
        계좌은행: user.bank_name || "",
        계좌번호: user.account_number || "",
        포인트: user.points || 0,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "사용자 포인트");

    // 엑셀 파일 다운로드
    XLSX.writeFile(
      workbook,
      `사용자_포인트_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>사용자 포인트 관리</CardTitle>
        <Button
          onClick={exportToExcel}
          className="flex items-center gap-2"
          disabled={isLoading || users.length === 0}
        >
          <Download className="h-4 w-4" />
          엑셀로 내보내기
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>계좌정보</TableHead>
                  <TableHead className="text-right">포인트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      표시할 사용자가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.bank_name && user.account_number
                          ? `${user.bank_name} ${user.account_number}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {user.points || 0} P
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
