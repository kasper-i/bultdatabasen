package model

import "fmt"

func getDescendantsQuery(depth Depth, table string) string {
	return fmt.Sprintf(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT child.id, child.name, child.type, child.parent_id
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= %d
	)
	SELECT * FROM cte
	INNER JOIN %s ON cte.id = %s.id`, depth, table, table)
}