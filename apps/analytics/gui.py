import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
import threading
import sys
import os

# main.py の関数をインポート
from main import run_analysis_and_push

class SyncGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Gold Volatility Sync Manager (MT5)")
        self.root.geometry("400x250")
        self.root.resizable(False, False)
        
        # タイトルラベル
        title_label = ttk.Label(root, text="MT5 同期管理ツール", font=("Meiryo", 14, "bold"))
        title_label.pack(pady=10)
        
        # 取得期間選択
        frame = ttk.Frame(root)
        frame.pack(pady=10, fill='x', padx=20)
        
        ttk.Label(frame, text="取得期間（初回や大規模取得用）:").pack(anchor='w')
        
        self.period_var = tk.StringVar(value="1_month")
        
        # 選択肢
        options = [
            ("約1ヶ月 (30,000分足)", 30000),
            ("約6ヶ月 (200,000分足)", 200000),
            ("約1年 (400,000分足)", 400000),
            ("約3年 (1,200,000分足)", 1200000)
        ]
        
        self.fetch_counts = {}
        row = ttk.Frame(frame)
        row.pack(fill='x', pady=5)
        
        for text, count in options:
            self.fetch_counts[text] = count
            rb = ttk.Radiobutton(row, text=text, value=text, variable=self.period_var)
            rb.pack(anchor='w')
            
        self.period_var.set(options[1][0]) # デフォルトは6ヶ月
        
        # 実行ボタン
        self.btn = ttk.Button(root, text="今すぐ同期を開始 (Push)", command=self.start_sync)
        self.btn.pack(pady=15, ipadx=10, ipady=5)
        
        # ステータス
        self.status_var = tk.StringVar(value="ステータス: 待機中")
        status_label = ttk.Label(root, textvariable=self.status_var, font=("Meiryo", 9))
        status_label.pack()

    def start_sync(self):
        selected_text = self.period_var.get()
        count = self.fetch_counts[selected_text]
        
        self.btn.config(state=tk.DISABLED)
        self.status_var.set("ステータス: MT5からデータ取得・分析中... (裏窓でログ確認)")
        
        # バックグラウンド処理
        def run_task():
            try:
                run_analysis_and_push(fetch_count=count)
                self.root.after(0, self.on_success)
            except Exception as e:
                self.root.after(0, self.on_error, str(e))
                
        threading.Thread(target=run_task, daemon=True).start()

    def on_success(self):
        self.btn.config(state=tk.NORMAL)
        self.status_var.set("ステータス: 同期完了！")
        messagebox.showinfo("完了", "Honoバックエンドへの同期が完了しました。\nブラウザをリロードしてください。")

    def on_error(self, err_msg):
        self.btn.config(state=tk.NORMAL)
        self.status_var.set(f"ステータス: エラー発生")
        messagebox.showerror("エラー", f"同期中にエラーが発生しました:\n{err_msg}")


if __name__ == "__main__":
    root = tk.Tk()
    app = SyncGUI(root)
    root.mainloop()
