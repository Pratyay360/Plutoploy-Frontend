import { Eye, EyeOff, Lock, Plus, Save, Trash2, Unlock } from "lucide-react";
import { useState } from "react";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

interface EnvVariablesEditorProps {
  variables: EnvVariable[];
  onSave?: (variables: EnvVariable[]) => void;
}

export function EnvVariablesEditor({
  variables: initialVariables,
  onSave,
}: EnvVariablesEditorProps) {
  const [variables, setVariables] = useState<EnvVariable[]>(initialVariables ?? []);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addVariable = () => {
    const newVar: EnvVariable = {
      id: crypto.randomUUID(),
      key: "",
      value: "",
      isSecret: false,
    };
    setVariables([...variables, newVar]);
  };

  const updateVariable = (
    id: string,
    field: "key" | "value" | "isSecret",
    value: string | boolean,
  ) => {
    setVariables(
      variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const handleSave = () => {
    onSave?.(variables);
  };

  return (
    <div className="rounded-xl border border-base-300/60 bg-base-200/60 overflow-hidden">
      <div className="p-4 border-b border-base-300/60 bg-base-200/40 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Environment Variables</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addVariable}
            className="btn btn-outline btn-xs"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary btn-xs"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-2 py-1 text-[11px] text-base-content/30 uppercase tracking-wider font-medium">
          <span>Key</span>
          <span>Value</span>
          <span className="w-8 text-center">Secret</span>
          <span className="w-8" />
        </div>

        {variables.map((variable) => (
          <div
            key={variable.id}
            className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center p-2 rounded-lg bg-base-100/60 border border-base-300/30 transition-all hover:border-base-300/60 hover:bg-base-100"
          >
            <input
              type="text"
              value={variable.key}
              onChange={(e) =>
                updateVariable(variable.id, "key", e.target.value)
              }
              placeholder="VARIABLE_NAME"
              className="input input-xs font-mono text-xs h-8 bg-transparent border-base-300/50 focus:border-primary/40"
            />
            <div className="relative">
              <input
                type={
                  variable.isSecret && !visibleSecrets.has(variable.id)
                    ? "password"
                    : "text"
                }
                value={variable.value}
                onChange={(e) =>
                  updateVariable(variable.id, "value", e.target.value)
                }
                placeholder="value"
                className="input input-xs font-mono text-xs h-8 pr-8 bg-transparent border-base-300/50 focus:border-primary/40"
              />
              {variable.isSecret && (
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility(variable.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                >
                  {visibleSecrets.has(variable.id) ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                updateVariable(variable.id, "isSecret", !variable.isSecret)
              }
              className={`btn btn-ghost btn-square btn-xs transition-colors ${
                variable.isSecret
                  ? "text-warning hover:text-warning"
                  : "text-base-content/30 hover:text-base-content"
              }`}
              title={variable.isSecret ? "Mark as visible" : "Mark as secret"}
            >
              {variable.isSecret ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => removeVariable(variable.id)}
              className="btn btn-ghost btn-square btn-xs text-base-content/30 hover:text-error hover:bg-error/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {variables.length === 0 && (
          <div className="text-center py-8 text-sm text-base-content/40">
            <p>No variables yet.</p>
            <button
              type="button"
              onClick={addVariable}
              className="btn btn-ghost btn-xs text-primary mt-2"
            >
              Add your first variable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
