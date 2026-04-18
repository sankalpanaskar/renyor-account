import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() helperText = '';
  @Input() inputName = 'file_upload';
  @Input() accept = '.pdf,.xls,.xlsx,.png,.jpg,.jpeg';
  @Input() multiple = false;
  @Input() required = false;

  @Output() filesChange = new EventEmitter<File[]>();

  selectedFiles: File[] = [];

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.updateFiles(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    this.updateFiles(files);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  private updateFiles(files: File[]): void {
    this.selectedFiles = this.multiple ? files : files.slice(0, 1);
    this.filesChange.emit(this.selectedFiles);
  }
}
