open('midi_note_chart', 'r') do |input|
  mapping = input.readlines.map do |line| # figure out what the mappings should be
    split_line = line.strip.split(/ +/)
    note = split_line[1].downcase.strip
    midi_number = split_line[0].strip
    [note, midi_number]
  end
  # convert the mappings to a javascript function which is just a giant
  # switch statement and dump the result to a file called 'note_mapping.js'
  case_statements = mapping.map {|pair| "    case '#{pair[0]}':\n      return #{pair[1]};"}
  switch_block = case_statements.join("\n")
  javascript_function = <<-EOF
var note_to_midi_mapper = function(note) \{
  switch (note) \{
#{switch_block}
  \}
\};
EOF
  open('note_mapping.js','w') {|output| output << javascript_function}
end
