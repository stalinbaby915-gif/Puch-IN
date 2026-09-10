# This makes "crud" behave as a package and exposes its two files (locations, shifts)
# as crud.locations and crud.shifts, so routers can write crud.locations.get_locations(...)
# instead of importing each file separately.

from . import locations
from . import shifts