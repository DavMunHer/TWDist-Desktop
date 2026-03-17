import { Observable } from 'rxjs';
import { Section } from '../entities/section.entity';

export abstract class SectionRepository {
  abstract create(section: Section): Observable<Section>;
  abstract update(section: Section): Observable<Section>;

  /**
   * Backend section routes are nested under a project, so `projectId` is required
   * for delete/find calls (where we may not have a `Section` instance yet).
   */
  abstract delete(projectId: string, sectionId: string): Observable<void>;
  abstract findById(projectId: string, sectionId: string): Observable<Section>;
}
