export interface Task {
  doc_id: string;
  result?: string;
  gene_file: string;
  status: string;
  reason?: string;
  session_id?: number;
}
