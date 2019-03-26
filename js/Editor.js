class Editor {
  constructor(id) {
    this.editorSetting = {
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      tabSize: 2,
      useSoftTabs: true,
      theme: "ace/theme/dracula",
      mode: "ace/mode/glsl"
    }

    this.annotations = [];
    
    this.ace = ace.edit(id);
    this.ace.setOptions(this.editorSetting);
  }
  
  setAnnotations(data) {
    this.annotations.push(data)
  }
  
  showAnnotations() {
    this.ace.session.setAnnotations(this.annotations);
  }

  setValue(value) {
    this.ace.session.setValue(value, 1);
  }

  getValue() {
    return this.ace.getValue();
  }
}