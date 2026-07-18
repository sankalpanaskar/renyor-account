import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ngx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @Input() helperText = '';
  @Input() inputName = 'file_upload';
  @Input() accept = '.pdf,.xls,.xlsx,.png,.jpg,.jpeg';
  @Input() multiple = false;
  @Input() required = false;

  @Output() filesChange = new EventEmitter<File[]>();

  selectedFiles: File[] = [];
  private previewUrls = new Map<File, string>();

  ngOnDestroy(): void {
    this.clearPreviewUrls();
  }

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

  isImageFile(file: File): boolean {
    return `${file?.type || ''}`.toLowerCase().startsWith('image/')
      || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file?.name || '');
  }

  getPreviewUrl(file: File): string {
    if (!this.isImageFile(file)) {
      return '';
    }

    let previewUrl = this.previewUrls.get(file);
    if (!previewUrl) {
      previewUrl = URL.createObjectURL(file);
      this.previewUrls.set(file, previewUrl);
    }
    return previewUrl;
  }

  getFileIcon(file: File): string {
    const fileName = `${file?.name || ''}`.toLowerCase();
    const mimeType = `${file?.type || ''}`.toLowerCase();
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'file-text-outline';
    }
    if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
      return 'grid-outline';
    }
    return 'file-outline';
  }

  onPreviewAreaClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  removeFile(file: File, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const previewUrl = this.previewUrls.get(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.previewUrls.delete(file);
    }

    this.selectedFiles = this.selectedFiles.filter((selectedFile: File) => selectedFile !== file);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.filesChange.emit(this.selectedFiles);
  }

  private updateFiles(files: File[]): void {
    this.clearPreviewUrls();
    this.selectedFiles = this.multiple ? files : files.slice(0, 1);
    this.filesChange.emit(this.selectedFiles);
  }

  private clearPreviewUrls(): void {
    this.previewUrls.forEach((previewUrl: string) => URL.revokeObjectURL(previewUrl));
    this.previewUrls.clear();
  }
}
