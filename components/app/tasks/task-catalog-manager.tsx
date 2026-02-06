"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useToast } from "../../ui/toast";

type TaskCatalogItem = {
  id: string;
  name: string;
  defaultBillableRate: number | null;
  isActive: boolean;
};

export function TaskCatalogManager({
  initialTasks,
  readOnly
}: {
  initialTasks: TaskCatalogItem[];
  readOnly: boolean;
}) {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<TaskCatalogItem[]>(initialTasks);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editActive, setEditActive] = useState(true);

  const startEdit = (task: TaskCatalogItem) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditRate(task.defaultBillableRate?.toString() ?? "");
    setEditActive(task.isActive);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditRate("");
    setEditActive(true);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          defaultBillableRate: newRate ? Number(newRate) : undefined,
          isActive: newActive
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create task");
      }
      const data = await response.json();
      setTasks((prev) => [data.data, ...prev]);
      setNewName("");
      setNewRate("");
      setNewActive(true);
      addToast({ title: "Task created", variant: "success" });
    } catch (error) {
      addToast({ title: "Create failed", description: "Please try again.", variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          defaultBillableRate: editRate ? Number(editRate) : null,
          isActive: editActive
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to update task");
      }
      const data = await response.json();
      setTasks((prev) => prev.map((task) => (task.id === id ? data.data : task)));
      cancelEdit();
      addToast({ title: "Task updated", variant: "success" });
    } catch (error) {
      addToast({ title: "Update failed", description: "Please try again.", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to delete task");
      }
      setTasks((prev) => prev.filter((task) => task.id !== id));
      addToast({ title: "Task deleted", variant: "success" });
    } catch (error) {
      addToast({ title: "Delete failed", description: "Please try again.", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-sand-200 bg-white/80 p-4">
        <p className="text-xs font-semibold uppercase text-ink-500">Create task</p>
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
          <div>
            <label className="text-xs uppercase text-ink-500">Task name</label>
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Discovery & Planning"
              className="mt-2"
              disabled={readOnly || creating}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-ink-500">Default rate</label>
            <Input
              value={newRate}
              onChange={(event) => setNewRate(event.target.value)}
              placeholder="0.00"
              type="number"
              min={0}
              className="mt-2"
              disabled={readOnly || creating}
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-xs text-ink-700">
              <input
                type="checkbox"
                checked={newActive}
                onChange={(event) => setNewActive(event.target.checked)}
                disabled={readOnly || creating}
              />
              Active
            </label>
            <Button size="sm" onClick={handleCreate} disabled={readOnly || creating || !newName.trim()}>
              {creating ? "Saving..." : "Add task"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-sm text-ink-500">No tasks yet.</p>}
        {tasks.map((task) => {
          const isEditing = editingId === task.id;
          return (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3"
            >
              <div className="flex-1">
                {isEditing ? (
                  <div className="grid gap-2 md:grid-cols-[2fr,1fr]">
                    <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                    <Input
                      value={editRate}
                      onChange={(event) => setEditRate(event.target.value)}
                      type="number"
                      min={0}
                    />
                    <label className="flex items-center gap-2 text-xs text-ink-700">
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(event) => setEditActive(event.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-ink-700">{task.name}</p>
                    <p className="text-xs text-ink-500">
                      {task.defaultBillableRate ? `Rate: ${task.defaultBillableRate}` : "No default rate"} ·{" "}
                      {task.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={() => handleUpdate(task.id)} disabled={readOnly || !editName.trim()}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => startEdit(task)} disabled={readOnly}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(task.id)} disabled={readOnly}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
