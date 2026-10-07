# One short log line per assistant event in claude's stream-json.
# Run as: jq -R -r --unbuffered -f progress.jq
def line: gsub("\\s+"; " ") | if length > 160 then .[:157] + "..." else . end;
fromjson?
| select(.type == "assistant")
| .message.content[]?
| if .type == "text" then "say: " + (.text | line)
  elif .type == "tool_use" then
    "tool: " + .name + " " + ((.input.command // .input.file_path // .input.pattern // .input.path // "") | tostring | line)
  else empty end
