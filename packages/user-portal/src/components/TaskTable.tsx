import React, { useEffect } from "react";
import { match } from "ts-pattern";
import { Task } from "../model/Task";
import cls from "classnames";

interface Props {
  tasks: Task[];
  actionDisbled: boolean;
  onConfirm: () => void;
}

const TaskTable: React.FC<Props> = ({ tasks, actionDisbled, onConfirm }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.scrollTo({
      behavior: "smooth",
      top: ref.current.scrollHeight,
    });
  }, [tasks]);
  return (
    <div className="h-48 overflow-x-auto" ref={ref}>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Command</th>
            <th>Result</th>
            <th>Input</th>
            <th>Status</th>
            <th>Fail Reason</th>
            <th>Comfirm Result</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const badgeClassName = match(task.status)
              .with("FAILED", () => "badge-warning")
              .with("FINISH", () => "badge-success")
              .with("PENDING", () => "badge-accent")
              .otherwise(() => "");
            console.log("task status", task.status, badgeClassName);
            return (
              <tr key={task.doc_id}>
                <td>{task.doc_id}</td>
                <td>{task.session_id}</td>
                <td>{task.result}</td>
                <td>{task.gene_file}</td>
                <td>
                  {task.status === "PROCESSING" ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    <span className={cls("badge", badgeClassName)}>
                      {task.status}
                    </span>
                  )}
                </td>
                <td>{task.reason}</td>
                <td>
                  <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 "
                    disabled={actionDisbled}
                    onClick={onConfirm}
                  >
                    Call
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
