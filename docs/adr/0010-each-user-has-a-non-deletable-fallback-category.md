# Each user has a non-deletable fallback category

Every User Account must have exactly one fallback Category, seeded as `Other` during migration. The fallback Category cannot be deleted because deleted category history is reassigned to it. Users may edit its display name, color, or icon, but Julius preserves its internal fallback role.
