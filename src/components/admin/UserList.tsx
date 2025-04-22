"use client";

import { Download, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllUsers,
  updateUserApprovalPoints,
} from "@/services/admin/admin-service";
import { User } from "@/types/auth";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPoints, setEditingPoints] = useState<{
    [key: string]: number | string;
  }>({});

  const [savingUser, setSavingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllUsers();
        setUsers(data);

        // 초기 편집 상태 설정
        const initialEditState = {};
        data.forEach((user) => {
          initialEditState[user.id] = user.blog_approval_points;
        });
        setEditingPoints(initialEditState);
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

    XLSX.writeFile(
      workbook,
      `사용자_포인트_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handlePointsChange = (userId: string, value: string) => {
    // 입력이 비어있거나 유효하지 않은 경우
    if (value === "" || isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0) {
      setEditingPoints((prev) => ({
        ...prev,
        [userId]: "",
      }));
    } else {
      // 유효한 숫자인 경우
      setEditingPoints((prev) => ({
        ...prev,
        [userId]: parseInt(value, 10),
      }));
    }
  };

  const saveApprovalPoints = async (userId: string) => {
    if (savingUser) return;

    try {
      setSavingUser(userId);

      const pointsValue = editingPoints[userId];
      const numericPoints =
        typeof pointsValue === "string" && pointsValue !== ""
          ? parseInt(pointsValue, 10)
          : typeof pointsValue === "number"
            ? pointsValue
            : 0;

      await updateUserApprovalPoints(userId, numericPoints);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, blog_approval_points: numericPoints }
            : user,
        ),
      );
    } catch (err) {
      console.error("포인트 업데이트 오류:", err);
      setError("포인트 업데이트에 실패했습니다.");
    } finally {
      setSavingUser(null);
    }
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
                  <TableHead>승인시 지급포인트</TableHead>
                  <TableHead className="text-right">보유 포인트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
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
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={
                              editingPoints[user.id] === ""
                                ? ""
                                : editingPoints[user.id]
                            }
                            onChange={(e) =>
                              handlePointsChange(user.id, e.target.value)
                            }
                            className="no-spin-buttons w-24"
                          />
                          <Button
                            size="sm"
                            onClick={() => saveApprovalPoints(user.id)}
                            disabled={savingUser === user.id}
                          >
                            {savingUser === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
