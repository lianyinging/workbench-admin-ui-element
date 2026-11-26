import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { FileForm, FileQuery, FileUploadVO, FileVO } from './types';

export function listFile(query?: FileQuery): AxiosPromise<PageResult<FileVO>> {
  return request({ url: '/system/file/list', method: 'get', params: query });
}

export function listMyFile(query?: FileQuery): AxiosPromise<PageResult<FileVO>> {
  return request({ url: '/system/file/my/list', method: 'get', params: query });
}

export function listByIds(fileIds: string | string[]): AxiosPromise<FileVO[]> {
  return request({ url: `/system/file/listByIds/${fileIds}`, method: 'get' });
}

export function getFile(fileId: number | string): AxiosPromise<FileVO> {
  return request({ url: `/system/file/${fileId}`, method: 'get' });
}

export function updateFile(data: FileForm) {
  return request({ url: '/system/file/my', method: 'put', data });
}

export function delFile(fileIds: number | number[] | string) {
  return request({ url: `/system/file/${fileIds}`, method: 'delete' });
}

export function delMyFile(fileIds: number | number[] | string) {
  return request({ url: `/system/file/my/${fileIds}`, method: 'delete' });
}

export function uploader(data: FormData): AxiosPromise<FileUploadVO> {
  return request({
    url: '/system/file/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function moveFile(categoryId: number, fileIds: number[]) {
  return request({ url: `/system/file/${categoryId}/move`, method: 'post', data: fileIds });
}

export function unlockFile(fileIds: Array<number | string>) {
  return request({ url: '/system/file/unlock', method: 'post', data: fileIds });
}

export function lockFile(fileIds: Array<number | string>) {
  return request({ url: '/system/file/lock', method: 'post', data: fileIds });
}

export function unlockMyFile(fileIds: Array<number | string>) {
  return request({ url: '/system/file/my/unlock', method: 'post', data: fileIds });
}

export function lockMyFile(fileIds: Array<number | string>) {
  return request({ url: '/system/file/my/lock', method: 'post', data: fileIds });
}
