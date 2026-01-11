import { Observable } from 'rxjs';
import { Section } from '../entities/section.entity';

export abstract class SectionRepository {
  abstract create(section: Section): Observable<Section>;
  abstract update(section: Section): Observable<Section>;
  abstract delete(sectionId: string): Observable<void>;
  abstract findById(sectionId: string): Observable<Section>;
}
