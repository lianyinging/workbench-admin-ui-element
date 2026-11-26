const FILE_SUFFIX_MAP: Record<string, string[]> = {
  image: 'jpg,jpeg,bmp,gif,png,svg,ico,tif,tiff,webp,pic,tga,jng,mng,jbg,jpe,heic,lbm'.split(','),
  archive: 'zip,7z,rar,gz,jar,lzh,taz,arj,z,ace,tar,xz,bz2,win'.split(','),
  excel: ['xls', 'xlsx', 'csv'],
  pdf: ['pdf'],
  ppt: ['ppt', 'pptx'],
  audio: ['wav', 'aif', 'au', 'mp3', 'ram', 'wma', 'mmf', 'amr', 'aac', 'flac', 'aifc', 'awr', 'cda', 'cdr', 'dig'],
  text: 'txt,sql,ini,xml,html,htm,css,scss,less,js,ts,java,inf,py,json'.split(','),
  video: 'avi,mp4,m4v,mkv,webm,flv,mov,wmv,3gp,3g2,mpg,vob,ogg,swf,dxr,fla,rm,mpe,mpeg,ts'.split(','),
  word: ['doc', 'docx', 'wps', 'rtf', 'odt']
};

export function getMediaType(file: { ext?: string; contentType?: string; fileSuffix?: string }) {
  const suffix = (file.ext || file.fileSuffix?.replace(/^\./, ''))?.toLowerCase();
  if (suffix) {
    const matched = Object.entries(FILE_SUFFIX_MAP).find(([, list]) => list.includes(suffix));
    if (matched) {
      return matched[0];
    }
  }
  const contentType = file.contentType?.toLowerCase();
  if (contentType?.startsWith('image/')) {
    return 'image';
  }
  if (contentType?.startsWith('video/')) {
    return 'video';
  }
  if (contentType?.startsWith('audio/')) {
    return 'audio';
  }
  return 'unknown';
}