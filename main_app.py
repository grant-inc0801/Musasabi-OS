```python
class MUSAAvatar:
    def __init__(self):
        self.visible = True
        self.draggable = True
        self.speech_bubble = True
        self.mode = "Learning Mode"
    
    def display(self):
        print(f"MUSA Avatar: Mode {self.mode}")

    def react_to_sales_event(self, event):
        print(f"Reacting to {event}")

    def open_dashboard(self):
        print("Dashboard opened")

class SalesWorkspace:
    def __init__(self):
        self.lead_list = []
        self.lead_details = {}
        self.call_history = []
        self.transcripts = []
        self.listening_notes = []
        self.next_actions = []
        self.coaching_panel = []

    def add_lead(self, lead):
        self.lead_list.append(lead)

    def view_lead_details(self, lead_id):
        return self.lead_details.get(lead_id, "Lead not found")

    def save_call_history(self, call):
        self.call_history.append(call)

class FileMakerSync:
    def __init__(self):
        self.field_mapping = {}
        self.import_preview = False
        self.duplicate_review = False
        self.safe_import = True
        self.sync_status = "Not Synced"

    def preview_import(self):
        self.import_preview = True
        print("Import preview available")

    def review_duplicates(self):
        self.duplicate_review = True
        print("Duplicates reviewed")

    def import_data(self):
        if self.safe_import:
            self.sync_status = "Synced"
            print("Data imported safely")

class ZoomPhoneSync:
    def __init__(self):
        self.call_logs = []
        self.call_status = "Not Synced"
        self.lead_matching = False
        self.unmatched_calls = []

    def import_call_logs(self):
        self.call_status = "Logs imported"
        print("Call logs imported")

    def match_leads(self):
        self.lead_matching = True
        print("Leads matched")

class LearningMode:
    def __init__(self):
        self.transcript_learning = []
        self.note_learning = []
        self.objections_learning = []
        self.rebuttals_learning = []
        self.best_talk_learning = []
        self.coaching_improvement = []

    def learn_from_transcript(self, transcript):
        self.transcript_learning.append(transcript)

class SalesCommandCenter:
    def __init__(self):
        self.todays_calls = []
        self.appointments = []
        self.appointment_rate = 0.0
        self.priority_leads = []
        self.callback_queue = []
        self.learning_status = "Inactive"
        self.musa_advice = []

    def display_metrics(self):
        return {
            "Today's Calls": len(self.todays_calls),
            "Appointments": len(self.appointments),
            "Appointment Rate": self.appointment_rate
        }

class HomeScreen:
    def __init__(self):
        self.musa_avatar = MUSAAvatar()
        self.sales_workspace = SalesWorkspace()
        self.sales_command_center = SalesCommandCenter()
        self.filemaker_status = FileMakerSync().sync_status
        self.zoom_phone_status = ZoomPhoneSync().call_status
        self.learning_status = LearningMode().coaching_improvement
        self.todays_calls = SalesCommandCenter().todays_calls
        self.todays_appointments = SalesCommandCenter().appointments

    def display(self):
        print("Home Screen:")
        print(self.musa_avatar.display())
        print(self.sales_workspace.lead_list)
        print(self.sales_command_center.display_metrics())
        print(f"FileMaker Status: {self.filemaker_status}")
        print(f"Zoom Phone Status: {self.zoom_phone_status}")
```
