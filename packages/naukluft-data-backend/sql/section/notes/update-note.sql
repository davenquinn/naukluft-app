UPDATE section.section_note
SET edited_note = ${note_text}::text
WHERE id = ${note_id}::integer
