"""Current candidate audit; V0.1 results remain in history/V0.1 and Git."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('audit-g6-03-remediation.py')), run_name='__main__')
