.PHONY: dump restore sync

dump:
	@./scripts/dump_railway.sh

restore:
	@./scripts/restore_local.sh

sync: dump restore
