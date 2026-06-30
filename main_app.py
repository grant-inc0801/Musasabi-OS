```python
import tkinter as tk

class SalesWorkspace:
    def __init__(self, root):
        self.root = root
        self.root.title("Sales Workspace MVP")
        
        self.create_left_panel()
        self.create_center_panel()
        self.create_right_panel()
        self.bind_shortcuts()

    def create_left_panel(self):
        self.left_panel = tk.Frame(self.root, width=200, bg='lightgrey')
        self.left_panel.pack(side='left', fill='y')
        self.create_lead_list_treeview()
        self.create_filters()
        self.create_search()

    def create_lead_list_treeview(self):
        self.lead_list = tk.Listbox(self.left_panel)
        self.lead_list.pack(fill='both', expand=True)

    def create_filters(self):
        filters = ["New", "Calling", "Callback", "Interested", "Closed"]
        self.filter_var = tk.StringVar(value=filters)
        filter_listbox = tk.Listbox(self.left_panel, listvariable=self.filter_var)
        filter_listbox.pack(fill='x')

    def create_search(self):
        self.search_entry = tk.Entry(self.left_panel)
        self.search_entry.pack(pady=5)

    def create_center_panel(self):
        self.center_panel = tk.Frame(self.root, width=400, bg='white')
        self.center_panel.pack(side='left', fill='both', expand=True)
        self.create_lead_details()

    def create_lead_details(self):
        details = ["Company Info", "Store Info", "Phone", "Address", 
                   "Industry", "Contact", "Email", "Website", 
                   "Call History", "Transcript", "Notes", "Next Action"]
        self.details_var = tk.StringVar(value=details)
        details_listbox = tk.Listbox(self.center_panel, listvariable=self.details_var)
        details_listbox.pack(fill='both', expand=True)

    def create_right_panel(self):
        self.right_panel = tk.Frame(self.root, width=200, bg='lightblue')
        self.right_panel.pack(side='right', fill='y')
        self.create_musa_sales_assistant()

    def create_musa_sales_assistant(self):
        assistant_entries = ["Customer Summary", "Opening", "Anticipated Objections", 
                             "Recommended Objections", "Closing Suggestions", 
                             "Next Best Action", "Learning Score", "Confidence"]
        self.assistant_var = tk.StringVar(value=assistant_entries)
        assistant_listbox = tk.Listbox(self.right_panel, listvariable=self.assistant_var)
        assistant_listbox.pack(fill='both', expand=True)

    def bind_shortcuts(self):
        self.root.bind('<Control-f>', self.search_shortcut)
        self.root.bind('<Control-r>', self.previous_search_shortcut)
        self.root.bind('<Control-n>', self.new_search_shortcut)
        self.root.bind('<Control-d>', self.duplicate_filter_shortcut)
        self.root.bind('<Control-t>', self.exclude_lead_shortcut)

    def search_shortcut(self, event):
        # Implement search functionality
        pass

    def previous_search_shortcut(self, event):
        # Implement previous search functionality
        pass

    def new_search_shortcut(self, event):
        # Implement new search functionality
        pass

    def duplicate_filter_shortcut(self, event):
        # Implement duplicate filter functionality
        pass

    def exclude_lead_shortcut(self, event):
        # Implement exclude lead functionality
        pass

if __name__ == "__main__":
    root = tk.Tk()
    app = SalesWorkspace(root)
    root.mainloop()
```