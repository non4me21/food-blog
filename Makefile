.PHONY: dump restore sync migrate generate

dump:
	@./scripts/dump_railway.sh

restore:
	@./scripts/restore_local.sh

sync: dump restore

migrate:
	@RAW=$$(grep "^DATABASE_URL" .env | cut -d'=' -f2-) && \
	cd frontend && DATABASE_URL="$${RAW//@postgres/@localhost}" npx drizzle-kit migrate

generate:
	@cd frontend && npx drizzle-kit generate $(if $(name),--name $(name),)
