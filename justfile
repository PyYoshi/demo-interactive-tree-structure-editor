install-serena-cli:
	@uv tool install serena-agent --from "git+https://github.com/oraios/serena@main"

serena-index:
	@serena project index --timeout '30.0'
