-- Immuabilité de `submissions` et `status_changes` : jamais d'UPDATE ni de DELETE.
-- La règle ne doit pas dépendre de la discipline du code applicatif : un script, une
-- migration ou une faute de frappe en SQL se heurtent aussi à la base.
-- (TRUNCATE n'est pas couvert : il exige d'être propriétaire de la table.)
CREATE FUNCTION "forbid_row_modification"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION '% is immutable: % is not allowed', TG_TABLE_NAME, TG_OP
		USING ERRCODE = 'restrict_violation';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "tr_submissions_immutable"
BEFORE UPDATE OR DELETE ON "submissions"
FOR EACH ROW EXECUTE FUNCTION "forbid_row_modification"();--> statement-breakpoint
CREATE TRIGGER "tr_status_changes_immutable"
BEFORE UPDATE OR DELETE ON "status_changes"
FOR EACH ROW EXECUTE FUNCTION "forbid_row_modification"();
